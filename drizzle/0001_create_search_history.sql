-- Create searchHistory table
CREATE TABLE IF NOT EXISTS `searchHistory` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `searchType` enum('NSN', 'PART_NUMBER') NOT NULL,
  `searchQuery` varchar(255) NOT NULL,
  `results` text,
  `resultCount` int DEFAULT 0,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_userId_createdAt` (`userId`, `createdAt`)
);
