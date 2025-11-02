import React from 'react';

export default function Loader({ size = 200 }) {
	const loaderSize = Math.round(size * 0.5);
	const textSize = Math.round(size * 0.18);

	return (
		<div style={{ 
			display: 'flex', 
			alignItems: 'center', 
			justifyContent: 'center', 
			height: '100%', 
			width: '100%', 
			background: 'linear-gradient(135deg, #243375ff 0%, #51267cff 100%)'
		}}>
			<div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<style>{`
					@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap');

					.loader-circle-11 {
						position: absolute;
						width: ${loaderSize}px;
						height: ${loaderSize}px;
						transform-style: preserve-3d;
						perspective: 800px;
					}

					.loader-circle-11 .arc {
						position: absolute;
						content: "";
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						border-radius: 50%;
						border-bottom: ${Math.round(loaderSize * 0.1)}px solid #ffffff;
						box-shadow: 0 0 30px rgba(255, 255, 255, 0.9), 
						           0 0 60px rgba(139, 92, 246, 0.6),
						           0 0 90px rgba(139, 92, 246, 0.4);
					}

					.loader-circle-11 .arc:nth-child(1) {
						animation: rotate1 1.15s linear infinite;
						animation-delay: -0.8s;
						border-bottom-color: #e0d4ff;
						filter: brightness(1.3);
					}

					.loader-circle-11 .arc:nth-child(2) {
						animation: rotate2 1.15s linear infinite;
						animation-delay: -0.4s;
						border-bottom-color: #c4b5fd;
						filter: brightness(1.2);
					}

					.loader-circle-11 .arc:nth-child(3) {
						animation: rotate3 1.15s linear infinite;
						animation-delay: 0s;
						border-bottom-color: #a78bfa;
						filter: brightness(1.1);
					}

					@keyframes rotate1 {
						from {
							transform: rotateX(35deg) rotateY(-45deg) rotateZ(0);
						}
						to {
							transform: rotateX(35deg) rotateY(-45deg) rotateZ(1turn);
						}
					}

					@keyframes rotate2 {
						from {
							transform: rotateX(50deg) rotateY(10deg) rotateZ(0);
						}
						to {
							transform: rotateX(50deg) rotateY(10deg) rotateZ(1turn);
						}
					}

					@keyframes rotate3 {
						from {
							transform: rotateX(35deg) rotateY(55deg) rotateZ(0);
						}
						to {
							transform: rotateX(35deg) rotateY(55deg) rotateZ(1turn);
						}
					}

					@keyframes pulse-text {
						0%, 100% {
							opacity: 1;
							text-shadow: 0 0 20px rgba(255, 255, 255, 1), 
							            0 0 40px rgba(199, 210, 254, 0.8),
							            0 0 60px rgba(165, 180, 252, 0.6);
						}
						50% {
							opacity: 1;
							text-shadow: 0 0 30px rgba(255, 255, 255, 1), 
							            0 0 60px rgba(199, 210, 254, 1),
							            0 0 90px rgba(165, 180, 252, 0.8);
						}
					}

					.synapse-center-text {
						font-family: 'Inter', system-ui, -apple-system, sans-serif;
						font-size: ${textSize}px;
						font-weight: 900;
						letter-spacing: 0.3em;
						text-transform: uppercase;
						color: #ffffff;
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						z-index: 10;
						animation: pulse-text 2s ease-in-out infinite;
						white-space: nowrap;
						filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.9));
					}

					.glow-circle {
						position: absolute;
						width: ${loaderSize * 0.8}px;
						height: ${loaderSize * 0.8}px;
						border-radius: 50%;
						background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(199, 210, 254, 0.15) 40%, rgba(139, 92, 246, 0) 70%);
						animation: pulse-glow 2s ease-in-out infinite;
					}

					@keyframes pulse-glow {
						0%, 100% {
							transform: scale(1);
							opacity: 0.7;
						}
						50% {
							transform: scale(1.15);
							opacity: 1;
						}
					}
				`}</style>

				{/* Background glow */}
				<div className="glow-circle"></div>

				{/* 3D rotating loader */}
				<div className="loader-circle-11">
					<div className="arc"></div>
					<div className="arc"></div>
					<div className="arc"></div>
				</div>

				{/* SYNAPSE text in center */}
				<div className="synapse-center-text">SYNAPSE</div>
			</div>
		</div>
	);
}