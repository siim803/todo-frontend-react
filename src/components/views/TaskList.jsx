import { DeleteOutlined } from "@ant-design/icons";
import { Input, Button, Checkbox, List, Col, Row, Space, Divider, notification } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const API_URL = "https://demo2.z-bit.ee";

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("access_token");

    const request = async (path, options = {}) => {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (response.status === 401) {
            localStorage.removeItem("access_token");
            navigate("/login");
            throw new Error("Unauthorized");
        }
        if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
        }
        if (response.status === 204) return null;
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);
        request("/tasks")
            .then((serverTasks) => setTasks(serverTasks.map((task) => ({
                id: task.id,
                name: task.title ?? "",
                description: task.desc ?? "",
                completed: task.marked_as_done ?? false,
            }))))
            .catch((error) => notification.error({ message: error.message }))
            .finally(() => setLoading(false));
    // Token and navigation are checked only when the task view opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNameChange = (task, event) => {
        const name = event.target.value;
        setTasks((current) => current.map((item) =>
            item.id === task.id ? { ...item, name } : item
        ));

        request(`/tasks/${task.id}`, {
            method: "PUT",
            body: JSON.stringify({ title: name }),
        }).catch((error) => notification.error({ message: error.message }));
    };

    const handleDescriptionChange = (task, event) => {
        const description = event.target.value;
        setTasks((current) => current.map((item) =>
            item.id === task.id ? { ...item, description } : item
        ));

        request(`/tasks/${task.id}`, {
            method: "PUT",
            body: JSON.stringify({ desc: description }),
        }).catch((error) => notification.error({ message: error.message }));
    };

    const handleCompletedChange = (task, event) => {
        const completed = event.target.checked;
        setTasks((current) => current.map((item) =>
            item.id === task.id ? { ...item, completed } : item
        ));

        request(`/tasks/${task.id}`, {
            method: "PUT",
            body: JSON.stringify({ marked_as_done: completed }),
        }).catch((error) => notification.error({ message: error.message }));
    };

    const handleAddTask = async () => {
        const title = newTaskTitle.trim();
        if (!title) {
            notification.error({ message: "Task title cannot be blank." });
            return;
        }

        try {
            const task = await request("/tasks", {
                method: "POST",
                body: JSON.stringify({ title, desc: newTaskDescription }),
            });
            setTasks((current) => [...current, {
                id: task.id,
                name: task.title ?? title,
                description: task.desc ?? newTaskDescription,
                completed: task.marked_as_done ?? false,
            }]);
            setNewTaskTitle("");
            setNewTaskDescription("");
        } catch (error) {
            notification.error({ message: error.message });
        }
    };

    const handleDeleteTask = async (task) => {
        try {
            await request(`/tasks/${task.id}`, { method: "DELETE" });
            setTasks((current) => current.filter((item) => item.id !== task.id));
        } catch (error) {
            notification.error({ message: error.message });
        }
    };

    return (
        <Row type="flex" justify="center" style={{minHeight: '100vh', marginTop: '6rem'}}>
            <Col span={12}>
                <Row justify="space-between" align="middle" style={{marginBottom: "1rem"}}>
                    <h1>Task List</h1>
                    <Button onClick={() => navigate("/logout")}>Logout</Button>
                </Row>
                <Space direction="vertical" style={{width: "100%"}}>
                    <Input
                        value={newTaskTitle}
                        onChange={(event) => setNewTaskTitle(event.target.value)}
                        onPressEnter={handleAddTask}
                        placeholder="Task title"
                    />
                    <Input.TextArea
                        value={newTaskDescription}
                        onChange={(event) => setNewTaskDescription(event.target.value)}
                        placeholder="Task description (optional)"
                        autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                    <Button type="primary" onClick={handleAddTask}>Add Task</Button>
                </Space>
                <Divider />
                <List
                    size="small"
                    bordered
                    loading={loading}
                    dataSource={tasks}
                    renderItem={(task) => <List.Item key={task.id}>
                        <Row type="flex" justify="space-between" align="middle" style={{width: '100%'}}>
                            <Space align="start">
                                <Checkbox checked={task.completed} onChange={(e) => handleCompletedChange(task, e)} />
                                <Space direction="vertical" style={{width: "20rem"}}>
                                    <Input value={task.name} onChange={(event) => handleNameChange(task, event)} placeholder="Task title" />
                                    <Input.TextArea
                                        value={task.description}
                                        onChange={(event) => handleDescriptionChange(task, event)}
                                        placeholder="Task description (optional)"
                                        autoSize={{ minRows: 2, maxRows: 4 }}
                                    />
                                </Space>
                            </Space>
                            <Button type="text" onClick={() => handleDeleteTask(task)}><DeleteOutlined /></Button>
                        </Row>
                    </List.Item>}
                />
            </Col>
        </Row>
    )
}