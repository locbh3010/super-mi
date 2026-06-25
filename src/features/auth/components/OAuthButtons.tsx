"use client";

import { GithubOutlined, GoogleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";
import { oauth } from "../services";
import { useAuthLayoutStyles } from "../styles";

type OAuthProviderKey = "google" | "github";

const OAuthButtons: React.FC = () => {
	const { styles } = useAuthLayoutStyles();
	const [loading, setLoading] = React.useState<OAuthProviderKey | null>(null);

	const handleOAuth = async (provider: OAuthProviderKey) => {
		try {
			setLoading(provider);
			const url = await oauth(provider);
			if (url) {
				window.location.href = url;
			}
		} catch (error) {
			console.error("OAuth error:", error);
			setLoading(null);
		}
	};

	return (
		<div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
			<Button
				block
				icon={<GoogleOutlined />}
				className={styles.oauthBtn}
				loading={loading === "google"}
				disabled={loading !== null && loading !== "google"}
				onClick={() => handleOAuth("google")}
			>
				Google
			</Button>
			<Button
				block
				icon={<GithubOutlined />}
				className={styles.oauthBtn}
				loading={loading === "github"}
				disabled={loading !== null && loading !== "github"}
				onClick={() => handleOAuth("github")}
			>
				GitHub
			</Button>
		</div>
	);
};

export default OAuthButtons;
