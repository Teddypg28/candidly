import { SESClient, GetIdentityVerificationAttributesCommand } from "@aws-sdk/client-ses";

export const verifyRecords = async (domain: string) => {
    if (domain.trim() !== "") {
        try {
            const client = new SESClient({ 
                region: "us-east-2", 
                credentials: { 
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
            }});
            const input = { 
                Identities: [ 
                    domain
                ],
            };
            const command = new GetIdentityVerificationAttributesCommand(input);
            const response: any = await client.send(command);
            const verificationStatus = response?.VerificationAttributes[domain].VerificationStatus
            return verificationStatus
        } catch (error) {
            throw error
        }
    }
}