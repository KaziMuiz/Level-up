import{defineConfig}from'vitest/config';
export default defineConfig({test:{coverage:{provider:'v8',include:['src/logic.js','src/validate.js','src/insights-client.js','api/insights.js']}}});