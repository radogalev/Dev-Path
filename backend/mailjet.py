"""
Mailjet email service for sending verification and notification emails
"""
from mailjet_rest import Client
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.


api_key = os.getenv('MAILJET_API_KEY')
api_secret = os.getenv('MAILJET_API_SECRET')
mailjet = Client(auth=(api_key, api_secret), version='v3.1')


def get_email_verification_template(user_name: str, verification_link: str) -> str:
    """
    Generate a beautiful email verification template using the app's color scheme.
    
    Args:
        user_name: Name of the user
        verification_link: The verification link to include in the email
    
    Returns:
        HTML template for email verification
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                width: 100% !important;
                background-color: #000000;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            }}
            table {{
                border-spacing: 0;
                border-collapse: collapse;
            }}
            .email-bg {{
                width: 100%;
                background: linear-gradient(145deg, #000000 0%, #03120b 50%, #000000 100%);
            }}
            .hero {{
                background: linear-gradient(145deg, #0b2d1d 0%, #062417 55%, #04140c 100%);
                border-bottom: 1px solid rgba(22, 163, 74, 0.22);
                padding: 56px 24px 42px;
                text-align: center;
            }}
            .badge {{
                display: inline-block;
                margin-bottom: 14px;
                padding: 6px 12px;
                border: 1px solid rgba(34, 197, 94, 0.35);
                border-radius: 999px;
                color: #8fe0be;
                font-size: 12px;
                letter-spacing: 0.4px;
                text-transform: uppercase;
                background-color: rgba(22, 163, 74, 0.14);
            }}
            .hero-title {{
                margin: 0;
                color: #eafff3;
                font-size: 34px;
                line-height: 1.2;
                font-weight: 800;
            }}
            .hero-subtitle {{
                margin: 14px auto 0;
                max-width: 620px;
                color: #9cd8bd;
                font-size: 15px;
                line-height: 1.8;
            }}
            .content-wrap {{
                width: 100%;
                max-width: 760px;
                margin: 0 auto;
                padding: 28px 18px 36px;
            }}
            .panel {{
                background-color: rgba(4, 15, 10, 0.88);
                border: 1px solid rgba(22, 163, 74, 0.18);
                border-radius: 12px;
                padding: 28px;
                color: #c7ede1;
            }}
            .greeting {{
                margin: 0 0 14px;
                color: #d9fff0;
                font-size: 18px;
                font-weight: 600;
            }}
            .message {{
                margin: 0 0 24px;
                color: #8bcfb1;
                font-size: 14px;
                line-height: 1.9;
            }}
            .cta-box {{
                margin: 0 0 24px;
                border: 1px solid rgba(22, 163, 74, 0.28);
                border-radius: 10px;
                background-color: rgba(22, 163, 74, 0.08);
                padding: 22px;
                text-align: center;
            }}
            .cta-label {{
                margin: 0 0 14px;
                color: #6b9e8a;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }}
            .button {{
                display: inline-block;
                background: linear-gradient(145deg, #15803d 0%, #166534 100%);
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 34px;
                border-radius: 7px;
                border: 1px solid #22c55e;
                font-size: 15px;
                font-weight: 700;
            }}
            .link-box {{
                margin: 0 0 18px;
                border-left: 3px solid rgba(22, 163, 74, 0.4);
                border-radius: 5px;
                background-color: rgba(2, 8, 5, 0.85);
                padding: 12px 14px;
            }}
            .link-label {{
                margin: 0 0 6px;
                color: #6b9e8a;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.4px;
                font-weight: 600;
            }}
            .link-value {{
                margin: 0;
                color: #22c55e;
                font-size: 12px;
                line-height: 1.6;
                word-break: break-all;
                font-family: 'Courier New', monospace;
            }}
            .footnote {{
                margin: 0;
                color: #8bcfb1;
                font-size: 13px;
                line-height: 1.8;
            }}
            .footer {{
                padding: 18px 20px 32px;
                text-align: center;
                color: #6b9e8a;
                font-size: 12px;
                line-height: 1.8;
            }}
            .footer a {{
                color: #22c55e;
                text-decoration: none;
                font-weight: 600;
            }}
            .warning {{
                margin-top: 10px;
                color: #ef7b7b;
                font-size: 12px;
            }}
            @media screen and (max-width: 600px) {{
                .hero {{
                    padding: 40px 16px 30px;
                }}
                .hero-title {{
                    font-size: 28px;
                }}
                .content-wrap {{
                    padding: 20px 12px 28px;
                }}
                .panel {{
                    padding: 20px;
                }}
                .button {{
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                }}
            }}
        </style>
    </head>
    <body>
        <table role="presentation" width="100%" class="email-bg">
            <tr>
                <td>
                    <table role="presentation" width="100%">
                        <tr>
                            <td class="hero">
                                <div class="badge">DevPath Security</div>
                                <h1 class="hero-title">Verify Your Email</h1>
                                <p class="hero-subtitle">One final step to activate your DevPath account and unlock your learning journey.</p>
                            </td>
                        </tr>
                    </table>

                    <table role="presentation" width="100%">
                        <tr>
                            <td>
                                <div class="content-wrap">
                                    <div class="panel">
                                        <p class="greeting">Hi {user_name},</p>
                                        <p class="message">
                                            Thanks for signing up. Please verify your email address to complete your registration and start using DevPath.
                                        </p>

                                        <div class="cta-box">
                                            <p class="cta-label">Click to continue</p>
                                            <a href="{verification_link}" class="button">Verify Email Address</a>
                                        </div>

                                        <div class="link-box">
                                            <p class="link-label">Or paste this link in your browser</p>
                                            <p class="link-value">{verification_link}</p>
                                        </div>

                                        <p class="footnote">
                                            This verification link expires in 24 hours. If you did not create this account, you can safely ignore this message.
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table role="presentation" width="100%">
                        <tr>
                            <td class="footer">
                                Need help? <a href="mailto:support@devpath.com">Contact Support</a><br>
                                © 2026 DevPath. All rights reserved.
                                <div class="warning">Never share this verification link with anyone.</div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def send_verification_email(user_email: str, user_name: str, verification_link: str) -> dict:
    """
    Send a verification email to the user.
    
    Args:
        user_email: Recipient's email address
        user_name: Recipient's name
        verification_link: The verification link to include
    
    Returns:
        API response from Mailjet
    """
    html_template = get_email_verification_template(user_name, verification_link)
    
    data = {
        'Messages': [
            {
                "From": {
                    "Email": os.getenv('MAILJET_FROM_EMAIL', 'noreply@devpath.com'),
                    "Name": "DevPath"
                },
                "To": [
                    {
                        "Email": user_email,
                        "Name": user_name
                    }
                ],
                "Subject": "Verify Your Email - DevPath",
                "TextPart": f"Hello {user_name}, please verify your email by visiting: {verification_link}",
                "HTMLPart": html_template
            }
        ]
    }
    
    result = mailjet.send.create(data=data)
    return result


# Example usage (for testing)
if __name__ == "__main__":
    # Test the template
    test_result = send_verification_email(
        user_email="radoatin.galev@gmail.com",
        user_name="John Doe",
        verification_link="https://yourdomain.com/verify?token=abc123def456"
    )
    print(test_result.status_code)
    print(test_result.json())