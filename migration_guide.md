# Migration Guide: MongoDB to Relational Database

This guide outlines the process for migrating the `MeshCatalogItem` and `OrganGroup` collections from a MongoDB database to a relational database such as MySQL or PostgreSQL.

---

## 1. Understanding the Data

The following MongoDB schemas are used:

### MeshCatalogItem Schema

* `meshName`: String, required, unique
* `displayName`: String, required
* `organGroupIds`: Array of ObjectIds, referencing `OrganGroup`
* `defaultStudyYear`: Number

### OrganGroup Schema

* `groupName`: String, required, unique
* `description`: String
* `defaultStudyYear`: Number

---

## 2. SQL Schema Design

The following SQL schema represents the equivalent structure:

### `organ_groups` Table

```sql
CREATE TABLE organ_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    default_study_year INT
);
```

### `mesh_catalog_items` Table

```sql
CREATE TABLE mesh_catalog_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mesh_name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    default_study_year INT
);
```

### `mesh_catalog_item_organ_group` (Pivot Table)

```sql
CREATE TABLE mesh_catalog_item_organ_group (
    mesh_catalog_item_id INT,
    organ_group_id INT,
    PRIMARY KEY (mesh_catalog_item_id, organ_group_id),
    FOREIGN KEY (mesh_catalog_item_id) REFERENCES mesh_catalog_items(id) ON DELETE CASCADE,
    FOREIGN KEY (organ_group_id) REFERENCES organ_groups(id) ON DELETE CASCADE
);
```

---

## 3. Data Migration Steps

The data is already exported, refer to the `meshdata` folder, however if you feel more comfortable with doing it yourself to preserve data integrity, follow these steps:

### Step 1: Export Data from MongoDB

Use `mongoexport` to extract the collections into JSON format:

```bash
mongoexport --uri="<mongodb_uri>" --collection=organgroups --out=organ_groups.json
mongoexport --uri="<mongodb_uri>" --collection=meshcatalogitems --out=mesh_catalog_items.json
```

### Step 2: Import Data into SQL Database

Write a script to parse and insert the JSON data into the SQL schema.

#### Example Insert Statements

**Insert into `organ_groups`:**

```sql
INSERT INTO organ_groups (group_name, description, default_study_year)
VALUES ('Leg', 'The lower limb of the human body.', 1);
```

**Insert into `mesh_catalog_items`:**

```sql
INSERT INTO mesh_catalog_items (mesh_name, display_name, default_study_year)
VALUES ('bones_Femur_L', 'Femur (L)', 1);
```

**Link with `mesh_catalog_item_organ_group`:**

```sql
INSERT INTO mesh_catalog_item_organ_group (mesh_catalog_item_id, organ_group_id)
VALUES (1, 1);
```

### Tips:

* Maintain a mapping of MongoDB ObjectIds to new integer IDs.
* Populate `organ_groups` and `mesh_catalog_items` first.
* Then link their relationships via the pivot table.

---

## Final Notes

* Validate the data after migration.
* Ensure foreign key constraints are respected.
* Perform dry-run testing in a staging environment before final deployment.
