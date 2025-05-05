body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  color: white;
  text-align: center;
  background: url('../images/backgrounds/pack_reveal_bg.jpg') no-repeat center center fixed;
  background-size: cover;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}

#background {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter: brightness(0.5);
}

#reveal-title {
  font-size: 48px;
  margin: 20px 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
}

.card-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 30px;
  animation: slideIn 1s ease-in-out;
}

.card-slot {
  position: relative;
  width: 180px;
  height: 260px;
  perspective: 1000px;
}

.card-img {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.6s ease;
}

.card-back {
  transform: rotateY(0deg);
}

.card-back.flip-out {
  transform: rotateY(90deg);
}

/* Border Glow by Rarity */
.border-common {
  box-shadow: 0 0 12px 2px #32cd32;
}

.border-uncommon {
  box-shadow: 0 0 12px 2px #1e90ff;
}

.border-rare {
  box-shadow: 0 0 12px 2px #ffa500;
}

.border-legendary {
  box-shadow: 0 0 15px 3px gold;
  animation: legendary-glow 1.6s ease-in-out infinite;
  transform-origin: center;
  border: 3px solid gold;
  z-index: 3;
}

@keyframes legendary-glow {
  0% {
    box-shadow: 0 0 15px 3px gold;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 30px 8px orange;
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 15px 3px gold;
    transform: scale(1);
  }
}

@keyframes flipIn {
  0% { transform: rotateY(90deg); opacity: 0; }
  100% { transform: rotateY(0deg); opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* "New!" Badge */
.new-unlock {
  position: absolute;
  top: 8px;
  left: 8px;
  background: crimson;
  color: white;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  z-index: 2;
}

/* Toast Message */
#toast-message {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #111;
  padding: 12px 24px;
  border-radius: 6px;
  opacity: 0;
  color: white;
  font-size: 18px;
  z-index: 999;
  transition: opacity 0.5s ease;
}

/* Countdown Text */
#countdown {
  font-size: 20px;
  color: #ddd;
  margin-top: 20px;
}

/* Close Button */
#closeBtn {
  margin-top: 20px;
  padding: 14px 28px;
  font-size: 18px;
  background: #2e8b57;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

#closeBtn:hover {
  background: #3cb371;
}
