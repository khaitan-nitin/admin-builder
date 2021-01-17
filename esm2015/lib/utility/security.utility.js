import * as CryptoJS from 'crypto-js';
export class SecurityUtils {
    static encrypt(data) {
        try {
            return CryptoJS.AES.encrypt(JSON.stringify(data), 'key').toString();
        }
        catch (e) {
            Error(e);
        }
    }
    static decrypt(data) {
        try {
            const bytes = CryptoJS.AES.decrypt(data, 'key');
            if (bytes.toString()) {
                return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            }
            return data;
        }
        catch (e) {
            Error(e);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkudXRpbGl0eS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvbml0aW5raGFpdGFuL05pdGluL3N0dWR5L2FuZ3VsYXIvbWF0ZXJpYWwvYWRtaW4tYnVpbGRlci1wbHVnaW4vcHJvamVjdHMvYWRtaW4tYnVpbGRlci9zcmMvIiwic291cmNlcyI6WyJsaWIvdXRpbGl0eS9zZWN1cml0eS51dGlsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxRQUFRLE1BQU0sV0FBVyxDQUFDO0FBRXRDLE1BQU0sT0FBTyxhQUFhO0lBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBUztRQUN0QixJQUFJO1lBQ0YsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3JFO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDVjtJQUNILENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQVM7UUFDdEIsSUFBSTtZQUNGLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRCxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDcEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3REO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ1Y7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBDcnlwdG9KUyBmcm9tICdjcnlwdG8tanMnO1xuXG5leHBvcnQgY2xhc3MgU2VjdXJpdHlVdGlscyB7XG4gIHN0YXRpYyBlbmNyeXB0KGRhdGE6IGFueSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gQ3J5cHRvSlMuQUVTLmVuY3J5cHQoSlNPTi5zdHJpbmdpZnkoZGF0YSksICdrZXknKS50b1N0cmluZygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIEVycm9yKGUpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBkZWNyeXB0KGRhdGE6IGFueSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBieXRlcyA9IENyeXB0b0pTLkFFUy5kZWNyeXB0KGRhdGEsICdrZXknKTtcbiAgICAgIGlmIChieXRlcy50b1N0cmluZygpKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGJ5dGVzLnRvU3RyaW5nKENyeXB0b0pTLmVuYy5VdGY4KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBFcnJvcihlKTtcbiAgICB9XG4gIH1cbn0iXX0=