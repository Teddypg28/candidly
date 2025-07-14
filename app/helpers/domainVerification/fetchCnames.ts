import { SESClient, VerifyDomainDkimCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ 
    region: "us-east-2", 
    credentials: { 
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
}});

export const fetchCnames = async (domain: string) => {

    if (domain.trim() !== "") {

        const command = new VerifyDomainDkimCommand({ Domain: domain });
    
        try {
            const response = await ses.send(command);
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