import {
  insertUser,
  updateUserByExternalId,
} from "@/actions/data/user/user-actions";
import { NewUser } from "@/drizzle/schema";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  console.log("attempting to handle clerk webhook");

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  switch (eventType) {
    case "user.created":
      try {
        const newUser: NewUser = {
          externalId: payload?.data?.id,
          firstName: payload?.data?.first_name,
          lastName: payload?.data?.last_name,
          email: payload?.data?.email_addresses?.[0]?.email_address,
          profileImageURL: payload?.data?.profile_image_url,
        };

        await insertUser(newUser);

        return NextResponse.json({
          status: 200,
          message: "User info inserted",
        });
      } catch (error: any) {
        console.error("Error inserting user:", error); // Log the error for debugging

        return NextResponse.json(
          {
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
          },
          { status: 400 }
        );
      }
      break;

    case "user.updated":
      try {
        if (!payload.data.id) {
          return NextResponse.json({
            status: 400,
            message: "Missing userId",
          });
        }

        const user: NewUser = {
          externalId: payload?.data?.id,
          firstName: payload?.data?.first_name,
          lastName: payload?.data?.last_name,
          email: payload?.data?.email_addresses?.[0]?.email_address,
          profileImageURL: payload?.data?.profile_image_url,
        };

        await updateUserByExternalId(payload.data.id, user);
        return NextResponse.json({
          status: 200,
          message: "User info updated",
        });
      } catch (error: any) {
        return NextResponse.json({
          status: 400,
          message: error.message,
        });
      }
      break;

    default:
      return new Response("Error occured -- unhandeled event type", {
        status: 400,
      });
  }

  return new Response("", { status: 201 });
}
