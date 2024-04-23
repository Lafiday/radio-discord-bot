const { Events, ActivityType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const config = require('../config.json');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`${client.user.tag}`);

    const channelId = config.channel;
    const guildId = config.guild;

    const youtubeLiveURL = config.yt;

    const channel = client.channels.cache.get(channelId);
    const adapterCreator = channel.guild.voiceAdapterCreator;

    if (!channel || !adapterCreator) {
      console.error('Não foi possível encontrar o canal de voz ou o adaptador de voz.');
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channelId,
      guildId: guildId,
      adapterCreator: adapterCreator,
    });

    connection.on('error', (error) => {
      console.error(`Erro ao conectar-se ao canal de voz: ${error.message}`);
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });

    connection.subscribe(player);

    const streamOptions = {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25 
    };

    const playAudioStream = () => {
      const stream = ytdl(youtubeLiveURL, streamOptions);
      const resource = createAudioResource(stream, { inlineVolume: true });
      player.play(resource);
    };

    playAudioStream();

    player.on('error', (error) => {
      console.error(`Erro ao reproduzir áudio: ${error.message}`);
    });

    player.on('stateChange', (oldState, newState) => {
      if (newState.status === AudioPlayerStatus.Idle) {
        playAudioStream();
      }
    });

    const activities = [
      { name: 'Lafiday', type: ActivityType.Custom },
      { name: 'https://lazulibot.netlify.app', type: ActivityType.Custom },
    ];

    function setRandomActivity() {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      client.user.setActivity({
        name: randomActivity.name,
        type: randomActivity.type,
      });
    }

    setRandomActivity();

    setInterval(() => {
      setRandomActivity();
    }, 60000);

    client.user.setStatus('idle');
  },
};
