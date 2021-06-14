export class CustomIdGenerator {

    public generateClientId(): string {
        
        // Return random string
        // Only small letters and numbers
        // e.g. 6de5ccda
        const randomString = Math.random().toString(16).substr(2, 6);
        console.log("randomString: " + randomString);

        return randomString;
    }
    
}
