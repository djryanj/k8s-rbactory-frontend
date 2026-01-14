#!/usr/bin/env node

// A quick script that makes sure relevant files have a header equal to their path

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  rootDir: process.cwd(),
  extensions: [".tsx", ".ts", ".jsx", ".js", ".css", ".scss"],
  excludeDirs: ["node_modules", "build", "dist", ".git", "coverage", "hack"],
  excludeFiles: ["check-file-headers.js", "install-hooks.js"],
  commentStyles: {
    ".tsx": "//",
    ".ts": "//",
    ".jsx": "//",
    ".js": "//",
    ".css": "/*",
    ".scss": "//",
  },
};

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes("--fix");
const checkGitOnly = args.includes("--git-only");

/**
 * Get the appropriate comment syntax for a file
 */
function getCommentStyle(filePath) {
  const ext = path.extname(filePath);
  const style = config.commentStyles[ext] || "//";

  if (style === "/*") {
    return {
      start: "/* ",
      end: " */",
    };
  }
  return {
    start: style + " ",
    end: "",
  };
}

/**
 * Generate the expected header comment for a file
 */
function generateHeader(filePath) {
  const relativePath = path.relative(config.rootDir, filePath);
  const comment = getCommentStyle(filePath);
  return `${comment.start}${relativePath}${comment.end}`;
}

/**
 * Check if a file has the correct header
 */
function checkFileHeader(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  if (lines.length === 0) {
    return { valid: false, currentHeader: null };
  }

  const expectedHeader = generateHeader(filePath);
  const firstLine = lines[0].trim();

  // Check if first line matches expected header
  const valid = firstLine === expectedHeader.trim();

  return {
    valid,
    currentHeader: firstLine,
    expectedHeader: expectedHeader.trim(),
  };
}

/**
 * Fix a file's header by adding or replacing it
 */
function fixFileHeader(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const expectedHeader = generateHeader(filePath);

  // Check if first line is already a path comment (even if wrong)
  const firstLine = lines[0].trim();
  const comment = getCommentStyle(filePath);
  const isPathComment =
    firstLine.startsWith(comment.start) &&
    (firstLine.includes("/") || firstLine.includes("\\"));

  let newContent;
  if (isPathComment) {
    // Replace the existing header
    lines[0] = expectedHeader;
    newContent = lines.join("\n");
  } else {
    // Add header at the top
    newContent = expectedHeader + "\n" + content;
  }

  fs.writeFileSync(filePath, newContent, "utf8");
}

/**
 * Get all files to check
 */
function getFilesToCheck() {
  if (checkGitOnly) {
    // Only check files tracked by git
    try {
      const output = execSync("git ls-files", { encoding: "utf8" });
      return output
        .split("\n")
        .filter((file) => file.trim())
        .map((file) => path.join(config.rootDir, file))
        .filter((file) => {
          const ext = path.extname(file);
          return (
            config.extensions.includes(ext) &&
            !config.excludeFiles.includes(path.basename(file))
          );
        });
    } catch (error) {
      console.error("Error getting git files:", error.message);
      process.exit(1);
    }
  } else {
    // Recursively find all files
    return getAllFiles(config.rootDir);
  }
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!config.excludeDirs.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (
        config.extensions.includes(ext) &&
        !config.excludeFiles.includes(file)
      ) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Main execution
 */
function main() {
  console.log("Checking file headers...\n");

  const files = getFilesToCheck();
  const issues = [];

  files.forEach((filePath) => {
    const result = checkFileHeader(filePath);

    if (!result.valid) {
      issues.push({
        filePath,
        ...result,
      });

      if (shouldFix) {
        fixFileHeader(filePath);
        console.log(`[FIXED] ${path.relative(config.rootDir, filePath)}`);
      }
    }
  });

  if (issues.length === 0) {
    console.log("[SUCCESS] All files have correct headers!");
    process.exit(0);
  }

  if (shouldFix) {
    console.log(`\n[SUCCESS] Fixed ${issues.length} file(s)`);
    process.exit(0);
  } else {
    console.log(
      `[ERROR] Found ${issues.length} file(s) with missing or incorrect headers:\n`
    );

    issues.forEach((issue) => {
      const relativePath = path.relative(config.rootDir, issue.filePath);
      console.log(`  ${relativePath}`);
      console.log(`    Current:  ${issue.currentHeader || "(none)"}`);
      console.log(`    Expected: ${issue.expectedHeader}\n`);
    });

    console.log("Run with --fix to automatically add headers");
    process.exit(1);
  }
}

// Run the script
main();
