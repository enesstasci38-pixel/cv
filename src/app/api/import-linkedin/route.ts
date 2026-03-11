import { ApifyClient } from 'apify-client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url || !url.includes('linkedin.com/in/')) {
            return NextResponse.json({ error: 'Valid LinkedIn profile URL is required.' }, { status: 400 });
        }

        const apifyClient = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
        });

        // Use a popular LinkedIn profile scraper actor
        const run = await apifyClient.actor('ahmqntmZjsA1xedD5').call({
            "cookie": [],
            "urls": [url],
            "minDelay": 2,
            "maxDelay": 5,
            "proxy": {
                "useApifyProxy": true
            }
        });

        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No data found for this profile.' }, { status: 404 });
        }

        const profile: any = items[0];

        // Format data to match our resume builder structure
        const formattedData = {
            name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
            experience: profile.experience?.map((exp: any) =>
                `${exp.title} at ${exp.companyName} (${exp.dateRange})\n- ${exp.description || ''}`
            ).join('\n\n') || '',
            education: profile.education?.map((edu: any) =>
                `${edu.degreeName || ''} in ${edu.fieldOfStudy || ''} from ${edu.schoolName || ''}`
            ).join('\n') || '',
            skills: profile.skills?.join(', ') || '',
            achievements: profile.certifications?.map((cert: any) => cert.name).join(', ') || '' // Using certifications as achievements placeholder
        };

        return NextResponse.json(formattedData);

    } catch (error: any) {
        console.error('LinkedIn Scraper Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to import LinkedIn data.' }, { status: 500 });
    }
}
