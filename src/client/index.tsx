import "./styles.css";

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import createGlobe from "cobe";
import usePartySocket from "partysocket/react";

// Sunucudan gelecek mesaj tipleri
import type { OutgoingMessage } from "../shared";
import type { LegacyRef } from "react";

function App() {
	const canvasRef = useRef<HTMLCanvasElement>();
	const [counter, setCounter] = useState(0);
	const positions = useRef<
		Map<
			string,
			{
				location: [number, number];
				size: number;
			}
		>
	>(new Map());

	const socket = usePartySocket({
		room: "default",
		party: "globe",
		onMessage(evt) {
			const message = JSON.parse(evt.data as string) as OutgoingMessage;
			if (message.type === "add-marker") {
				positions.current.set(message.position.id, {
					location: [message.position.lat, message.position.lng],
					size: message.position.id === socket.id ? 0.1 : 0.05,
				});
				setCounter((c) => c + 1);
			} else {
				positions.current.delete(message.id);
				setCounter((c) => c - 1);
			}
		},
	});

	useEffect(() => {
		let phi = 0;
		const globe = createGlobe(canvasRef.current as HTMLCanvasElement, {
			devicePixelRatio: 2,
			width: 400 * 2,
			height: 400 * 2,
			phi: 0,
			theta: 0,
			dark: 1,
			diffuse: 0.8,
			mapSamples: 16000,
			mapBrightness: 6,
			baseColor: [0.3, 0.3, 0.3],
			markerColor: [0.8, 0.1, 0.1],
			glowColor: [0.2, 0.2, 0.2],
			markers: [],
			opacity: 0.7,
			onRender: (state) => {
				state.markers = [...positions.current.values()];
				state.phi = phi;
				phi += 0.01;
			},
		});

		return () => {
			globe.destroy();
		};
	}, []);

	return (
		<div className="App">
			<h1>Evlibeyler.com</h1>
			<h2 style={{ color: '#fff', marginBottom: '20px' }}>Forumumuz yakında hizmette olacak!</h2>
			
			{counter !== 0 ? (
				<p>
					Şu an bu sayfada <b>{counter}</b> kişi bizimle birlikte.
				</p>
			) : (
				<p>&nbsp;</p>
			)}

			<canvas
				ref={canvasRef as LegacyRef<HTMLCanvasElement>}
				style={{ width: 400, height: 400, maxWidth: "100%", aspectRatio: 1 }}
			/>

			<p>
				Kardeş sitemiz: <a href="https://evlihanimlar.com" target="_blank" rel="noopener noreferrer">evlihanimlar.com</a>
			</p>
		</div>
	);
}

createRoot(document.getElementById("root")!).render(<App />);
