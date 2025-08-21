import React from "react";
import { useForm } from "react-hook-form";

function SignUp({ onSwitchToLogin }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = (data) => console.log(data);

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    Create Your Account
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* First Name */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium">
                            First Name
                        </label>
                        <input
                            id="firstName"
                            {...register("firstName", { required: "First name is required" })}
                            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                        )}
                    </div>

                    {/* Repeat for other fields */}
                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            {...register("lastName", { required: "Last name is required" })}
                            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                                    message: "Invalid email address"
                                }
                            })}
                            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium">
                            Phone
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            {...register("phone", {
                                required: "Phone is required",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Phone must be 10 digits"
                                }
                            })}
                            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 8, message: "Minimum 8 characters" }
                            })}
                            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Use at least 8 characters, including a number or symbol.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline">
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
}

export default SignUp;
