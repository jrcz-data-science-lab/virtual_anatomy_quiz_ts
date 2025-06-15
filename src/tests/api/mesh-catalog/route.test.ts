import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/mesh-catalog/route";

describe("/api/mesh-catalog route", () => {
  it("should return a list of mesh catalog items", async () => {
    const req = new Request("http://localhost:3000/api/mesh-catalog");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const meshItems = await res.json();
    expect(meshItems).toBeInstanceOf(Array);
    expect(meshItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          meshName: expect.any(String),
          displayName: expect.any(String),
        }),
      ])
    );
  });

  it("should return a filtered list of mesh catalog items when searching by displayName (case-insensitive)", async () => {
    const req = new Request(
      "http://localhost:3000/api/mesh-catalog?search=cuboid"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const meshItems = await res.json();
    expect(meshItems).toBeInstanceOf(Array);
    expect(meshItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          meshName: expect.stringMatching(/cuboid/i),
          displayName: expect.stringMatching(/cuboid \(L\)/i),
        }),
      ])
    );
  });

  it("should return a filtered list of mesh catalog items when searching by meshName (case-insensitive)", async () => {
    const req = new Request(
      "http://localhost:3000/api/mesh-catalog?search=cuboid_l"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const meshItems = await res.json();
    expect(meshItems).toBeInstanceOf(Array);
    expect(meshItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          meshName: expect.stringMatching(/bones_Cuboid_L/i),
          displayName: expect.stringMatching(/cuboid \(L\)/i),
        }),
      ])
    );
  });

  it("should return an exact mesh catalog item when searching by specific meshName", async () => {
    const req = new Request(
      "http://localhost:3000/api/mesh-catalog?meshName=bones_Cuboid_L"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const meshItems = await res.json();
    expect(meshItems).toBeInstanceOf(Array);
    expect(meshItems.length).toBeGreaterThan(0); // Expect at least one item
    expect(meshItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: "683d927a4aa26f052a9a887c",
          meshName: "bones_Cuboid_L",
          displayName: "Cuboid (L)",
          defaultStudyYear: 1,
          organGroupIds: expect.arrayContaining([expect.any(String)]), // Check for array containing string IDs
        }),
      ])
    );
  });

  it("should return an empty list when searching with a non-matching query", async () => {
    const req = new Request(
      "http://localhost:3000/api/mesh-catalog?search=nonexistentmesh"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const meshItems = await res.json();
    expect(meshItems).toEqual([]);
  });

  it("should return an empty list when searching with a non-matching exact meshName", async () => {
    const req = new Request(
      "http://localhost:3000/api/mesh-catalog?meshName=nonexistent_Exact_Mesh"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const meshItems = await res.json();
    expect(meshItems).toEqual([]);
  });

  it("should create a new mesh catalog item", async () => {
    const newMeshItemData = {
      meshName: "new_test_mesh",
      displayName: "New Test Mesh",
      defaultStudyYear: 1,
      organGroupIds: ["507f1f77bcf86cd799439011"], // Example ObjectId
    };

    const req = new Request("http://localhost:3000/api/mesh-catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMeshItemData),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const createdMeshItem = await res.json();
    expect(createdMeshItem).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        meshName: newMeshItemData.meshName,
        displayName: newMeshItemData.displayName,
        defaultStudyYear: newMeshItemData.defaultStudyYear,
        organGroupIds: expect.arrayContaining([expect.any(String)]),
        __v: expect.any(Number),
      })
    );
    expect(createdMeshItem.organGroupIds[0]).toBe(
      newMeshItemData.organGroupIds[0]
    );
  });
});
