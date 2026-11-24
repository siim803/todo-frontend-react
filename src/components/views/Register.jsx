import { Button, Col, Form, Input, Row, notification } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

const API_URL = "https://demo2.z-bit.ee";

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: values.username,
                    firstname: values.firstname || undefined,
                    lastname: values.lastname || undefined,
                    newPassword: values.password,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Could not create account");
            }
            if (!data.access_token) {
                throw new Error("Account created, but no access token was returned");
            }

            localStorage.setItem("access_token", data.access_token);
            notification.success({ message: "Account created and logged in" });
            navigate("/");
        } catch (error) {
            notification.error({ message: error.message || "Could not create account" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row type="flex" justify="center" align="middle" style={{ minHeight: "100vh" }}>
            <Col xs={20} sm={12} md={8} lg={6}>
                <h1>Register</h1>
                <Form
                    name="register"
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ username: "", firstname: "", lastname: "", password: "", confirmPassword: "" }}
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                            { required: true, message: "Please input your username!" },
                            { max: 64, message: "Username cannot exceed 64 characters" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="First name" name="firstname">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Last name" name="lastname">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Confirm password"
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Please confirm your password!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>Register</Button>
                        <span style={{ marginLeft: "1rem" }}>
                            Already have an account? <Link to="/login">Login</Link>
                        </span>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    );
}
