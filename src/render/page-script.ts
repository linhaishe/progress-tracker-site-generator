export const pageScript = `
const embeddedSnapshot = window.__PROGRESS_TRACKER_SNAPSHOT__;

function splitSections(markdown) {
  const normalized = String(markdown || "").replace(/\\r\\n/g, "\\n").trim();
  const sections = {};
  const matches = Array.from(normalized.matchAll(/^##\\s+(.+)$/gm));
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    const start = match.index + match[0].length;
    const end = next ? next.index : normalized.length;
    sections[match[1].trim().toLowerCase()] = normalized.slice(start, end).trim();
  }
  return sections;
}

function applyPastedMarkdown() {
  const progress = document.getElementById("progressMarkdownInput").value;
  const progressSections = splitSections(progress);
  document.querySelector("[data-live-current-goal]").textContent = progressSections["current goal"] || "No current goal found in pasted markdown.";
  document.querySelector("[data-live-next-workflow]").textContent = progressSections["recommended next workflow"] || "No recommended next workflow found in pasted markdown.";
  document.querySelector("[data-live-milestone-status]").textContent = progressSections["current phase"] || "No current phase found in pasted markdown.";
}

function resetSnapshot() {
  document.getElementById("progressMarkdownInput").value = embeddedSnapshot.progressMarkdown;
  applyPastedMarkdown();
}

async function loadFileInto(inputId, fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  document.getElementById(inputId).value = await file.text();
  applyPastedMarkdown();
}

window.applyPastedMarkdown = applyPastedMarkdown;
window.resetSnapshot = resetSnapshot;
window.loadFileInto = loadFileInto;
`;
