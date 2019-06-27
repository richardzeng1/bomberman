const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  autoFocus: false
};

const players = {};

function preload() {
    this.load.image('ship', 'assets/spaceship.png');
}

function create() {
    const self = this;
    this.players = this.physics.add.group();

    io.on('connection', function(socket){
        console.log('A user connected');

        players[socket.id] = {
            rotation: 0,
            x: Math.floor(Math.random() * 700) + 50,
            y: Math.floor(Math.random() * 500) + 50,
            playerId: socket.id,
            team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
        }

        addPlayer(self, players[socket.id]);
        socket.emit('currentPlayers', players); // Connected user
        socket.broadcast.emit('newPlayer', players[socket.id]) // Existing users

        socket.on('disconnect', ()=>{
            console.log('User disconnected')
            // remove player from server
            removePlayer(self, socket.id);
            delete players[socket.id];
            io.emit('disconnect', socket.id);
        })
    })
}

function update() {}

function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    player.setDrag(100);
    player.setAngularDrag(100);
    player.setMaxVelocity(200);
    player.playerId = playerInfo.playerId;
    self.players.add(player)
}

function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player)=>{
        if (playerId === player.playerId){
            player.destroy()
        }
    })
}

const game = new Phaser.Game(config);
window.gameLoaded()
