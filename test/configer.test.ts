import * as path from "path";
import * as fs from "fs";
import { } from "jest";
import * as pr from "../src/project";

function getPath(f: string) {
    return path.join(__dirname, f);
}

describe("grunt: generated tasks", () => {
    describe("gruntConcat()", () => {
        it("gruntConcat(): Clean input, check result", () => {
            const data = JSON.parse(fs.readFileSync(getPath("fixtures/grunt_tasks.json")).toString());
            let project = new pr.Project();
            project = project.jsonLoad(data);
            const concat = project.gruntConcat();

            expect(concat).toHaveProperty("files");

            // expect(concat).toHaveProperty("tmp/sub-result/styles/c.css");
            expect(concat.files["tmp/sub-result/styles/c.css"]).toHaveLength(2);
            expect(concat.files["tmp/sub-result/styles/c.css"][0]).toBe("tmp/sub/styles/c1.css");
            expect(concat.files["tmp/sub-result/styles/c.css"][1]).toBe("tmp/sub/styles/c2.css");

            // expect(concat.files).toHaveProperty("tmp/sub-result/scripts/a.js");
            expect(concat.files["tmp/sub-result/scripts/a.js"]).toHaveLength(2);
            expect(concat.files["tmp/sub-result/scripts/a.js"][0]).toBe("tmp/sub/scripts/a1.js");
            expect(concat.files["tmp/sub-result/scripts/a.js"][1]).toBe("tmp/sub/scripts/a2.js");

            // expect(concat.files).toHaveProperty("tmp/sub-result/styles/d.css");
            expect(concat.files["tmp/sub-result/styles/d.css"]).toHaveLength(2);
            expect(concat.files["tmp/sub-result/styles/d.css"][0]).toBe("tmp/sub/sub/d1.css");
            expect(concat.files["tmp/sub-result/styles/d.css"][1]).toBe("tmp/sub/sub/d2.css");

            // expect(concat.files).toHaveProperty("tmp/sub-result/sub/b.js");
            expect(concat.files["tmp/sub-result/sub/b.js"]).toHaveLength(2);
            expect(concat.files["tmp/sub-result/sub/b.js"][0]).toBe("tmp/sub/sub/b1.js");
            expect(concat.files["tmp/sub-result/sub/b.js"][1]).toBe("tmp/sub/sub/b2.js");
        });
    });
});