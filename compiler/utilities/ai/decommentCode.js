import { GoogleGenAI, Language } from "@google/genai";

// try{
    const ai = new GoogleGenAI({});
// }catch(error){
//     console.log(error);
// }

export default async (code, language) => {
    try{
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Remove all the comments from this ${Language} given code wihout changing anything else. Respond only with the new code in plain text(not markdown) and nothing else.
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