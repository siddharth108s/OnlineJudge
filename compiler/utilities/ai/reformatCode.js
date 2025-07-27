import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export default async (code, language="") => {
    try{
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `reformat and indent this ${language} code properly, do not change or add anything. Output only the code in plain text (not markdown) and nothing else.
        <code>
        ${code}
        </code>
        `,
        });
        console.log(response?.text);
        return response?.text?.trim();
    }catch(error){
        console.log(error);
    }
}