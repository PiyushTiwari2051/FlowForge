import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { parseConfig } from "@/lib/config/parser";
import { compileCodebase } from "@/lib/github/exporter";
import { Octokit } from "@octokit/rest";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { appId, repoName, githubToken } = body;

    if (!appId || !repoName || !githubToken) {
      return NextResponse.json({ error: "Missing required export parameters" }, { status: 422 });
    }

    // Load app configuration
    const appRecord = await prisma.app.findUnique({
      where: { id: appId },
    });

    if (!appRecord) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const config = parseConfig(JSON.parse(appRecord.config));
    const files = compileCodebase(appId, config);

    // Initialize Octokit client
    const octokit = new Octokit({ auth: githubToken });

    // 1. Get authenticated user profile (to determine the repository owner)
    let owner = "";
    try {
      const userRes = await octokit.users.getAuthenticated();
      owner = userRes.data.login;
    } catch (e: any) {
      return NextResponse.json({ error: "Invalid GitHub Personal Access Token" }, { status: 401 });
    }

    // 2. Check or Create repository
    let repoExists = false;
    try {
      await octokit.repos.get({ owner, repo: repoName });
      repoExists = true;
    } catch (e) {
      // Repository doesn't exist, proceed to create
    }

    if (!repoExists) {
      try {
        await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          private: true,
          description: `Generated config-driven web app: ${config.app.name}`,
          auto_init: true, // Creates initial README commit and main branch automatically
        });
        
        // Wait a brief moment for GitHub repository instantiation to finish
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err: any) {
        return NextResponse.json({ error: "Failed to create GitHub repository", details: err.message }, { status: 400 });
      }
    }

    // 3. Compile Tree Push
    try {
      // Get reference to main branch
      const refRes = await octokit.git.getRef({
        owner,
        repo: repoName,
        ref: "heads/main",
      });

      const latestCommitSha = refRes.data.object.sha;

      // Get latest commit to find base tree SHA
      const commitRes = await octokit.git.getCommit({
        owner,
        repo: repoName,
        commit_sha: latestCommitSha,
      });
      const baseTreeSha = commitRes.data.tree.sha;

      // Create Git Tree nodes
      const treeNodes = files.map((f) => ({
        path: f.path,
        mode: "100644" as const,
        type: "blob" as const,
        content: f.content,
      }));

      const newTreeRes = await octokit.git.createTree({
        owner,
        repo: repoName,
        tree: treeNodes,
        base_tree: baseTreeSha,
      });

      // Create Commit
      const newCommitRes = await octokit.git.createCommit({
        owner,
        repo: repoName,
        message: "Feat: Compile and build workspace deployment from FlowForge",
        tree: newTreeRes.data.sha,
        parents: [latestCommitSha],
      });

      // Update branch reference pointer
      await octokit.git.updateRef({
        owner,
        repo: repoName,
        ref: "heads/main",
        sha: newCommitRes.data.sha,
      });

      return NextResponse.json({
        success: true,
        repoUrl: `https://github.com/${owner}/${repoName}`,
      });
    } catch (gitErr: any) {
      console.error("[GitHub Exporter Git Error]:", gitErr);
      return NextResponse.json({ error: "Failed to commit codebase files to repository", details: gitErr.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[GitHub Exporter API Error]:", error);
    return NextResponse.json({ error: "Failed to run GitHub export pipeline", details: error.message }, { status: 500 });
  }
}
