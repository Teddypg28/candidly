import { VerifyDomainDkimCommand } from "@aws-sdk/client-ses";
import SESClient from "~/utils/SESClient";

export const fetchCnames = async (domain: string) => {

    if (domain.trim() !== "") {

        const command = new VerifyDomainDkimCommand({ Domain: domain });
    
        try {
            const response = await SESClient.send(command);
            const tokens = response.DkimTokens;
    
            if (tokens) {
                const cnameRecords = tokens.map(token => ({
                  Name: `${token}._domainkey.${domain}`,
                  Type: "CNAME",
                  Value: `${token}.dkim.amazonses.com`
                }));
                return cnameRecords;
            }
          } catch (error) {
            console.error("Error fetching DKIM CNAME records:", error);
            throw error;
          }
    }
    
}