import React, { useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { useCreateUserMutation } from "@/state/api";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
    },
  },
});

const formFields = {
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      inputProps: { required: true },
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      inputProps: { type: "email", required: true },
    },
    password: {
      order: 3,
      placeholder: "Enter your password",
      label: "Password",
      inputProps: { type: "password", required: true },
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      inputProps: { type: "password", required: true },
    },
  },
};

const AuthProvider = ({ children }: any) => {
  const [createUser] = useCreateUserMutation();

  const handleSignUp = async (user: any) => {
    try {
      // Create user in our database when they sign up
      await createUser({
        username: user.username,
        cognitoId: user.userId,
        email: user.signInDetails?.loginId,
        profilePictureUrl: "p1.jpeg",
        teamId: 1,
      });
    } catch (error) {
      console.error("Error creating user in database:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticator 
        formFields={formFields}
        services={{
          async handleSignUp(formData) {
            // Handle the sign up and then create user in our DB
            const { username, password, attributes } = formData;
            try {
              // Let Amplify handle the actual sign up
              const result = await Amplify.Auth.signUp({
                username,
                password,
                attributes,
              });
              
              // If successful, create user in our database
              if (result.user) {
                await handleSignUp({
                  username,
                  userId: result.user.userId,
                  signInDetails: { loginId: attributes?.email },
                });
              }
              
              return result;
            } catch (error) {
              throw error;
            }
          },
        }}
      >
        {({ user }: any) =>
          user ? (
            <div>{children}</div>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="max-w-md w-full">
                <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  Project Management App
                </h1>
                <p className="text-center text-gray-600 mb-4">
                  Please sign in to continue
                </p>
              </div>
            </div>
          )
        }
      </Authenticator>
    </div>
  );
};

export default AuthProvider;