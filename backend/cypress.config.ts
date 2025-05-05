import { defineConfig } from "cypress";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: false,
    setupNodeEvents(on, config) {
      on("task", {
        uploadComparison({ studyId, token }) {
          const form = new FormData();
          const filePath = path.resolve("cypress/fixtures/child_questioning_stance_transparent.png");

          form.append("stimuli", fs.createReadStream(filePath));
          form.append("question", "Rate this image");
          form.append("type", "scale");
          form.append("order", "0");
          form.append("instructions", "Rate from 1 to 5");
          form.append(
            "config",
            JSON.stringify({
              scaleMin: 1,
              scaleMax: 5,
              scaleLabels: ["Very Poor", "Poor", "Neutral", "Good", "Excellent"],
            })
          );

          return fetch(`http://localhost:5000/api/studies/${studyId}/comparisons`, {
            method: "POST",
            headers: {
              Cookie: `access_token=${token}`,
            },
            body: form,
          }).then(async (res) => {
            const text = await res.text();
            return {
              status: res.status,
              body: text,
            };
          });
        },
      });
    },
  },
});
