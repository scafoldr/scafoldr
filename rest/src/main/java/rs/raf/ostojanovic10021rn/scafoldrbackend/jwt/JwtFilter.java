package rs.raf.ostojanovic10021rn.scafoldrbackend.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.User;
import rs.raf.ostojanovic10021rn.scafoldrbackend.repository.UserRepository;

import java.io.IOException;
import java.util.ArrayList;


@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {

        String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                email = jwtService.extractEmail(jwt);
            } catch (Exception e) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtService.isTokenValid(jwt)) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                UserDetails userDetails = org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password("")
                        .authorities(new ArrayList<>())
                        .build();

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

}
