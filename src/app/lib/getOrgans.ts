import dbConnect from "./dbConnect";
import { Organ } from "../models/Quiz";

/**
 * Retrieves all organ documents from the database.
 *
 * The function connects to the database using the `dbConnect` function,
 * performs a `find` query on the `Organ` model to retrieve all organ documents,
 * and returns them as plain JavaScript objects using the `lean` method.
 * In case of an error during the process, it logs the error message and returns
 * an empty array.
 *
 * @returns {Promise<IOrgan[]>} A promise that resolves with an array of organ documents
 * or an empty array if the query fails.
 */

export async function getOrgans() {
  try {
    await dbConnect();
    const organs = await Organ.find({}).lean();
    return organs;
  } catch (error) {
    console.error("Failed to get organs", error);
    return [];
  }
}
