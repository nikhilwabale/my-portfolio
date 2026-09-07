package com.nikhilwabale.portfolioapi.filter;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    private FilterChain chain;

    @BeforeEach
    void setUp() {
        filter = new RateLimitFilter();
        chain = mock(FilterChain.class);
    }

    @Test
    void allowsUpToThreeRequestsPerHourFromTheSameIp() throws Exception {
        for (int i = 1; i <= 3; i++) {
            var response = sendContactRequest("203.0.113.10");
            assertThat(response.getStatus()).isEqualTo(200);
        }
        verify(chain, times(3)).doFilter(any(), any());
    }

    @Test
    void blocksTheFourthRequestWithinTheWindow() throws Exception {
        for (int i = 1; i <= 3; i++) {
            sendContactRequest("203.0.113.11");
        }

        var response = sendContactRequest("203.0.113.11");

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getContentType()).isEqualTo("application/json;charset=UTF-8");
        assertThat(response.getContentAsString())
                .isEqualTo("{\"success\":false,\"message\":\"Too many requests. Please try again later.\"}");
        verify(chain, times(3)).doFilter(any(), any());
    }

    @Test
    void tracksEachIpInAnIndependentBucket() throws Exception {
        for (int i = 1; i <= 3; i++) {
            sendContactRequest("203.0.113.20");
        }
        // A different IP should not be affected by 203.0.113.20 already being exhausted.
        var response = sendContactRequest("203.0.113.21");

        assertThat(response.getStatus()).isEqualTo(200);
        verify(chain, times(4)).doFilter(any(), any());
    }

    @Test
    void doesNotRateLimitRequestsOutsideTheContactEndpoint() throws Exception {
        for (int i = 0; i < 5; i++) {
            var request = new MockHttpServletRequest("GET", "/health");
            request.setRemoteAddr("203.0.113.30");
            var response = new MockHttpServletResponse();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(200);
        }
        verify(chain, times(5)).doFilter(any(), any());
    }

    @Test
    void doesNotRateLimitGetRequestsToTheContactPath() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/contact");
        request.setRemoteAddr("203.0.113.40");
        var response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        verify(chain).doFilter(request, response);
    }

    private MockHttpServletResponse sendContactRequest(String remoteIp) throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/contact");
        request.setRemoteAddr(remoteIp);
        var response = new MockHttpServletResponse();
        response.setStatus(200); // default, mirrors what a downstream handler would leave it as

        filter.doFilter(request, response, chain);
        return response;
    }
}
