const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;  // Usa el puerto proporcionado por Render o el predeterminado

// Rutas básicas (puedes agregar más rutas si lo necesitas)
app.get('/', (req, res) => {
  res.send('Bot en línea');
});

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// Configuración del bot
const CHANNEL_ID = "1275840094426628259";
const DESTINATION_CHANNEL_ID = "1275838792896348196";
const GUILD_ID = "1275838792896348190";

const horario = {
    apertura: { hora: 8, minutos: 0 }, // Hora de apertura (8:00 AM)
    cierre: { hora: 17, minutos: 30 },  // Hora de cierre (5:30 PM)
};

// Función para actualizar permisos y mover usuarios
const actualizarPermisos = async () => {
    try {
        const now = new Date();
        const currentHourUTC = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();

        let currentHour = currentHourUTC - 5;

        if (currentHour < 0) {
            currentHour += 24; // Ajustar si la hora es menor que 0 (pasando a un día anterior)
          }

        console.log(`Hora actual: ${currentHour}:${currentMinute}`);

        const guild = await client.guilds.fetch(GUILD_ID);
        const channel = await guild.channels.fetch(CHANNEL_ID);
        const destinationChanel = await guild.channels.fetch(DESTINATION_CHANNEL_ID);

        // Verificar si es hora de abrir o cerrar el canal
        if (currentHour === horario.apertura.hora && currentMinute === horario.apertura.minutos) {
            // Abrir el canal
            await channel.permissionOverwrites.edit(guild.roles.everyone, {
                ViewChannel: true,
            });
            console.log("Canal Abierto");
        } else if (currentHour === horario.cierre.hora && currentMinute === horario.cierre.minutos) {
            // Mover a los usuarios antes de cerrar el canal
            if (channel.isVoiceBased()) {
                const members = channel.members;

                for (const [memberId, member] of members) {
                    await member.voice.setChannel(destinationChanel);
                    console.log(`Usuario ${member.user.tag} movido al canal destino`);
                }
            }
            // Cerrar el canal
            await channel.permissionOverwrites.edit(guild.roles.everyone, {
                ViewChannel: false,
            });
            console.log("Canal Cerrado");
        }
    } catch (error) {
        console.error('Error en actualizar permisos:', error);
    }
};

client.once('ready', () => {
    console.log('Bot iniciado como ${client.user.tag}');

    // Actualizar permisos al inicio y luego cada minuto
    actualizarPermisos();
    setInterval(actualizarPermisos,  60 * 1000); // 30 minuto
});

// Iniciar sesión con el bot
client.login(process.env.TOKEN);
