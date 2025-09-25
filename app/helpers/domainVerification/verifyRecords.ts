import { GetIdentityVerificationAttributesCommand } from "@aws-sdk/client-ses";
import SESClient from "~/utils/SESClient";

export const verifyRecords = async (domain: string) => {
    if (domain.trim() !== "") {
        try {
            const input = { 
                Identities: [ 
                    domain
                ],
            };
            const command = new GetIdentityVerificationAttributesCommand(input);
            const response: any = await SESClient.send(command);
            const verificationStatus = response?.VerificationAttributes[domain].VerificationStatus
            return verificationStatus
        } catch (error) {
            throw error
        }
    }
}