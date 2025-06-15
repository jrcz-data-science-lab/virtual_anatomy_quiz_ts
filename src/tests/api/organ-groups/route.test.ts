import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/organ-groups/route";

describe("/api/organ-groups route", () => {
  it("should return a list of organ groups", async () => {
    const req = new Request("http://localhost:3000/api/organ-groups");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const organGroups = await res.json();
    expect(organGroups).toBeInstanceOf(Array);
    expect(organGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          groupName: expect.any(String),
        }),
      ])
    );
  });

  it("should return a filtered list of organ groups when searching", async () => {
    const req = new Request(
      "http://localhost:3000/api/organ-groups?search=heart"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const organGroups = await res.json();
    expect(organGroups).toBeInstanceOf(Array);
    expect(organGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          groupName: expect.stringContaining("Heart"),
          description: expect.stringContaining("Heart"),
          defaultStudyYear: expect.any(Number),
        }),
      ])
    );
  });

  it("should return an empty list when searching with a non-matching query", async () => {
    const req = new Request(
      "http://localhost:3000/api/organ-groups?search=invalid"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const organGroups = await res.json();
    expect(organGroups).toEqual([]); // Expect an empty array
  });
});
