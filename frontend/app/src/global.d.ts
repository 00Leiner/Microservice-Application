interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (input: {
          client_id: string,
          callback: (response: any) => void
        }) => void;
        renderButton: (
          element: HTMLElement | null,
          options: {
            type?: 'standard' | 'icon';
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin' | 'signup' | 'continue';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            logo_alignment?: 'left' | 'center';
            width?: number;
            locale?: string;
          }
        ) => void;
      }
    }
  }
}
