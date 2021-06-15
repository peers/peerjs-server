export class CustomIdGenerator {

    public generateClientId(lengthOfId: number): string {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

        let randomString = "";

        for (let i = 0; i < lengthOfId; i++)
            randomString += charset.charAt(Math.floor(Math.random() * charset.length));

        return randomString;
    }
    
}
