import { Router, Request, Response } from "express";
import client from "../../index";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    res.status(400).send("Missing username");
    return;
  }

  try {
    const query = `
      INSERT INTO users (username)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await client.query(query, username);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while creating the user");
  }
});

export default router;
