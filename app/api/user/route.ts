import { getCurrentUserIdFromSession } from "@/actions/data/user/user-actions";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
        return Response.json({ error: 'Clerk ID is required' }, { status: 400 });
    }

    try {
        const userId = await getCurrentUserIdFromSession(clerkId);
        return Response.json({ userId });
    } catch (error) {
        console.error(error)
        return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}