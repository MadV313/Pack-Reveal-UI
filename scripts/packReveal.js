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
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

#reveal-title {
  font-size: 52px;
  font-weight: bold;
  margin-bottom: 30px;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
}

.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 30px;
}

.card-slot {
  width: 180px;
  height: 260px;
  position: relative;
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

.card-back.flip-out {
  transform: rotateY(90deg);
}

#countdown {
  font-size: 22px;
  color: #ddd;
  margin-top: 20px;
}

#closeBtn {
  margin-top: 16px;
  padding: 12px 24px;
  font-size: 20px;
  background: #2e8b57;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

#closeBtn:hover {
  background: #3cb371;
}

#toast {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  padding: 14px 28px;
  font-size: 18px;
  color: white;
  border-radius: 6px;
  opacity: 0;
  z-index: 999;
  transition: opacity 0.4s ease-in-out;
}

#toast.show {
  opacity: 1;
}
