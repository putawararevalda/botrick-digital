# Robotrick Digital

A pure frontend digital implementation of the fantastic trick-taking board game **Robotrick** (R.B. Trick). This version allows a single player to play against two simulated bots and the deterministic AI player, Droco.

## How to Run

### Using Docker Compose
You can easily spin up the game using Docker Compose. A lightweight Nginx web server will host the static files.

```bash
docker-compose up -d
```
Then, open your browser and navigate to `http://localhost:8877`.

### Local Python Server
Alternatively, you can run it without Docker using Python's built-in HTTP server:
```bash
python -m http.server 8877
```
Then visit `http://localhost:8877`.

## Features
*   **Complete Game Loop**: Full 3-round implementation including the card passing phase and scoring.
*   **Droco AI Logic**: Accurate implementation of Droco's deterministic AI cards (using actual card rules and images).
*   **Bot Opponents**: Simulated human opponents that follow game constraints and use simple heuristics to challenge you.
*   **Dynamic UI**: Responsive interface that highlights valid plays, visualizes captured cards (+/- points), and indicates the trick leader.

## Acknowledgements

This project is a fan-made digital implementation and is not affiliated with the creators of the physical game.

**Robotrick** is an original board game designed by **Domi** and developed by hal_99. Artwork by decoctdesign. 
Published by **Korokorodou LLC** (© 2022 Korokorodou LLC). 
If you enjoy this digital version, please consider supporting the designers and publisher by purchasing the physical board game!
