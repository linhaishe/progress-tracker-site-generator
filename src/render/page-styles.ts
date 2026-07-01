export const pageStyles = `
:root {
  --background: #EEEFE9;
  --surface: #FDFDF8;
  --muted-surface: #F4F4F0;
  --text: #111827;
  --body-text: #374151;
  --muted-text: #65675E;
  --border: #D2D3CC;
  --primary: #EB9D2A;
  --danger: #F35454;
  --warning: #F7A501;
  --success: #36C46F;
  --info: #30ABC6;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--background);
  color: var(--body-text);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  line-height: 1.55;
}
button, textarea, input { font: inherit; }
.shell { max-width: 1440px; margin: 0 auto; padding: 20px; }
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}
.title { margin: 0; color: var(--text); font-size: 24px; line-height: 32px; }
.meta { color: var(--muted-text); font-size: 12px; margin-top: 4px; }
.cockpit {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-areas:
    "focus focus focus focus focus focus focus focus milestone milestone milestone milestone"
    "stack stack stack stack stack stack stack stack stack stack stack stack";
  gap: 16px;
  padding: 16px;
  align-items: stretch;
}
.cockpit > * { min-width: 0; }
.focus-card { grid-area: focus; }
.milestone-card { grid-area: milestone; }
.content-stack { display: grid; grid-area: stack; gap: 16px; min-width: 0; }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 14px;
}
.label {
  color: var(--muted-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}
.heading { margin: 4px 0 0; color: var(--text); font-size: 20px; line-height: 28px; }
.accent {
  margin-top: 10px;
  padding: 8px;
  border-left: 3px solid var(--primary);
  background: var(--muted-surface);
}
.card p { margin: 8px 0 0; }
.section-grid { display: grid; grid-template-columns: 1fr; gap: 16px; padding: 0 16px 16px; }
.list { margin: 10px 0 0; padding-left: 18px; line-height: 1.6; }
.list li + li { margin-top: 8px; }
.empty { color: var(--muted-text); font-style: italic; }
.milestone-bar { display: flex; gap: 4px; margin-top: 8px; }
.milestone-segment { height: 8px; flex: 1; border-radius: 2px; background: var(--border); }
.milestone-segment.done { background: var(--success); }
@media (max-width: 900px) {
  .header, .cockpit, .section-grid { display: block; }
  .card { margin-top: 10px; }
  .shell { padding: 10px; }
}
`;
