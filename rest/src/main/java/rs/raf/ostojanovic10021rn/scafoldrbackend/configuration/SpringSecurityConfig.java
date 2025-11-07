package rs.raf.ostojanovic10021rn.scafoldrbackend.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import rs.raf.ostojanovic10021rn.scafoldrbackend.jwt.JwtFilter;
import rs.raf.ostojanovic10021rn.scafoldrbackend.jwt.JwtUtil;
import rs.raf.ostojanovic10021rn.scafoldrbackend.repository.UserRepository;
import rs.raf.ostojanovic10021rn.scafoldrbackend.service.UserService;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SpringSecurityConfig {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtFilter jwtFilter = new JwtFilter(jwtUtil, userRepository);
        http
                .cors(cors -> {})
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/v1/user/send-code").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/user/verify").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}


