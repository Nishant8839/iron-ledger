# Use an official Java 23 environment
FROM eclipse-temurin:23-jdk
WORKDIR /app

# Copy all the backend files into the container
COPY . .

# Grant permission and build the Spring Boot app
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Expose the port and start the server
EXPOSE 8080
CMD ["sh", "-c", "java -jar target/*.jar"]