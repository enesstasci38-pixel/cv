import React from 'react';

interface ResumeData {
    name: string;
    experience: string;
    education: string;
    skills: string;
    achievements: string;
}

export function MinimalTemplate({ data }: { data: ResumeData }) {
    return (
        <div className="font-sans text-left w-full h-full p-8 bg-white text-black shadow-sm overflow-auto">
            <h1 className="text-4xl font-light mb-2">{data.name || "John Doe"}</h1>
            <hr className="border-gray-300 my-4" />

            <div className="mb-6">
                <h2 className="text-lg font-semibold tracking-wider text-gray-700 uppercase mb-2">Professional Experience</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed">{data.experience || "Software Engineer with 5+ years of experience..."}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold tracking-wider text-gray-700 uppercase mb-2">Education</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed">{data.education || "B.S. in Computer Science - University Name"}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold tracking-wider text-gray-700 uppercase mb-2">Skills</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed">{data.skills || "React, Next.js, Node.js, TypeScript"}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold tracking-wider text-gray-700 uppercase mb-2">Key Achievements</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed">{data.achievements || "Improved system performance by 40%..."}</p>
            </div>
        </div>
    );
}
