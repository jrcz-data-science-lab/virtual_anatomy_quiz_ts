# Virtual Anatomy Quizzing System

## 1. Overview

The API and quiz creation system for the [Virtual Anatomy](https://github.com/jrcz-data-science-lab/Virtual-Anatomy-UE) project. <br>
To view the MongoDB -> SQL migration guide, see the [Migration Guide](https://github.com/jrcz-data-science-lab/virtual_anatomy_quiz_ts/blob/main/migration_guide.md) file.

## 2. Features

- **Quiz Management**: Teachers can create, edit, schedule, and delete quizzes.
- **Study Year Grouping**: Quizzes are authored for a specific study year (e.g., Year 1, Year 4), allowing question difficulty and detail to be adjusted accordingly.
- **Dynamic "Select Organ" Questions**: This question type can target either a broad anatomical region (an "Organ Group") or a specific 3D mesh (`MeshCatalogItem`), making it adaptable for different knowledge levels.
- **Multiple Question Types**: Supports "Multiple Choice", "True/False", "Select Organ", and "Short Answer" questions.
- **Anatomical Data Catalog**: A database-driven catalog (`meshCatalogItems` and `organGroups`) defines all interactable 3D meshes and their relationships to broader anatomical groups.
- **Quiz Submission API**: A dedicated endpoint (`/api/submissions`) for the Unreal Engine client to submit completed quiz answers in a single request.
- **Results Dashboard**: A detailed results page for teachers to analyze quiz performance on a per-question basis with charts and response lists.

## 3. Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **API**: REST (implemented via Next.js API Routes)
- **UI Components**: ShadCN UI, built on Radix UI & Tailwind CSS
- **Charting**: Recharts
- **3D Client**: Unreal Engine (consumes the API)

## 4. Project Structure

A brief overview of the key directories in this repository:

```
/src.
├── app
│   ├── api
│   │   ├── mesh-catalog  # Routes to handle specific meshes
│   │   ├── organ-groups  # Routes to handle organ-groups
│   │   ├── quizzes  # Routes to handle quiz data
│   │   │   └── [id]
│   │   │       └── results  # Routes to handle specific results of a specific quiz
│   │   └── submissions  # Routes to handle submissions
│   ├── api-docs  # Scalar documentation page
│   ├── components  # Specific components
│   ├── create  # Quiz creation page
│   ├── edit
│   │   └── [id]  # Edit a specific quiz
│   ├── lib  # Custom hooks & other random stuff
│   ├── models  # Mongoose models
│   ├── planned  # Planned quizzes
│   └── results  # Results page
│       └── [id]  # Results per quiz
├── components  # ShadCN components
│   └── ui
├── lib
└── tests  # Unit tests per API route
    └── api
        ├── mesh-catalog
        ├── organ-groups
        ├── quizzes
        │   └── [id]
        │       └── results
        └── submissions
```

## 5. Setup and Installation

Follow these steps to get the project running locally.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- An active MongoDB instance (local or a cloud service like MongoDB Atlas)

### Installation Steps

Clone the repository:

```bash
git clone https://github.com/jrcz-data-science-lab/virtual_anatomy_quiz_ts
cd virtual_anatomy_quiz_ts
```

Install dependencies:

```bash
npm install --force
# or
yarn install --force
```

Set up environment variables:

- Create a `.env` file in the root of the project by copying the `.env.example` file
- Add your MongoDB connection strings:

```env
MONGODB_URI="your_mongodb_connection_string"
MONGODB_URI_TEST="your_mongodb_connection_string/testingdb"
```

Run the development server:

```bash
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## 6. API Endpoints

The application exposes several REST endpoints:

- `GET /api/quizzes`: Retrieves a list of all quizzes. Can be filtered by study year (e.g., `?studyYear=1`).
- `POST /api/quizzes`: Creates a new quiz.
- `GET, PUT, DELETE /api/quizzes/[id]`: Fetches, updates, or deletes a specific quiz.
- `POST /api/submissions`: Submits answers for a completed quiz from Unreal Engine.
- `GET /api/quizzes/[id]/results`: Retrieves aggregated, chart-ready results for a specific quiz.
- `GET /api/mesh-catalog`: Fetches anatomical mesh data. Supports searching (e.g., `?search=femur`).
- `GET /api/organ-groups`: Fetches anatomical group data. Supports searching (e.g., `?search=bones`).

## 7. Available Scripts

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server.
- `npm run test`: Runs the unit tests

## 8. Future Development

Potential future ideas for this system are:

- Implementing a full grading system to store scores on submissions.
- Adding user authentication and roles (e.g., Teacher, Student Admin).
- Building a web UI for managing the Mesh Catalog and Organ Groups directly within the application (CRUD meshes and organ groups directly from this site).
- Quiz templates
