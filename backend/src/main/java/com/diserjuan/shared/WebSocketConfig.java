package com.diserjuan.shared;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilitamos un broker simple en memoria
        // Los clientes se suscribirán a rutas que empiecen con "/topic"
        config.enableSimpleBroker("/topic");

        // Prefijo para mensajes que van DEL cliente AL servidor (no lo usaremos mucho ahora)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Punto de conexión (Handshake)
        // setAllowedOriginPatterns("*") es CRÍTICO para que React se conecte
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // Habilita fallback para navegadores viejos
    }
}