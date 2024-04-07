export enum APIStatus {
    Success,
    BadRequest,
    Unauthorized,
    NotFound,
    ServerError
}

export interface PageProps {
    navigateToMainPage(): void;
    navigateToSignUpPage(): void;
    navigateToLoginPage(): void;
    navigateToPersonalPage(): void;
}
