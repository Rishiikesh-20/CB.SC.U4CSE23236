Campus Notifications Microservice Design

Stage 1 - REST API Design

Endpoints

1. Get all notifications

GET `/notifications?studentId=1042`

```json
{
  "count": 5,
  "notifications": [
    {
      "id": "a1b2c3",
      "studentId": 1042,
      "message": "Your DBMS result got published",
      "type": "Result",
      "priority": 2,
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30Z"
    }
  ]
}
```

2. Get important notifications

GET `/notifications/priority?studentId=1042&limit=10`

```json
{
  "count": 5,
  "notifications": [
    {
      "id": "b283218f",
      "studentId": 1042,
      "message": "CSX company hiring started",
      "type": "Placement",
      "priority": 3,
      "score": 35.2
    }
  ]
}
```

3. Send notifications in bulk

POST `/notifications/send`

```json
{
  "studentIds": [1001,1002,1003],
  "message": "Placement season starts from May 1",
  "type": "Event"
}
```

Response

```json
{
  "message": "Notifications send successfully",
  "count": 3
}
```

4. Mark notification as read

PUT `/notifications/:id/read`

```json
{
  "message": "Marked as read"
}
```

Stage 2 - Database Design

MySQL Schema

```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  studentId INT NOT NULL,
  message TEXT NOT NULL,
  type ENUM('Event','Result','Placement') NOT NULL,
  priority INT DEFAULT 0,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_studentId(studentId),
  INDEX idx_isRead(isRead),
  INDEX idx_priority(priority)
);
```

I used ENUM for type because only fixed notification types are there.
Indexes are added because table size can become very large later.
Priority column is stored separately instead of calculating everytime.

If notification count becomes very huge, older notifications can be archived monthly.

Stage 3 - Query Optimization

Original query

```sql
SELECT * FROM notifications
WHERE studentId = 1042 AND isRead = false;
```

Problem with this is full table scan can happen when records become very large.

Optimized query

```sql
SELECT * FROM notifications
WHERE studentId = 1042
AND isRead = false
ORDER BY priority DESC, createdAt DESC
LIMIT 100;
```

Added compound indexes for faster lookup.

Stage 4 - Caching

Redis can be used for caching unread notifications.

```javascript
async function fetchNotifications(studentId) {

  const cacheKey = `notif:${studentId}`;

  const cached = await redis.get(cacheKey);

  if(cached) {
    return JSON.parse(cached);
  }

  const notifications = await db.query(
    'SELECT * FROM notifications WHERE studentId=?',
    [studentId]
  );

  await redis.setex(
    cacheKey,
    300,
    JSON.stringify(notifications)
  );

  return notifications;
}
```

This reduces DB load a lot for active users.

Stage 5 - Bulk Notification Sending

For sending notifications to many students, batching can be used.

```javascript
async function sendBulk(studentIds,message,type) {

  const batch = [];

  for(const studentId of studentIds) {

    batch.push({
      studentId,
      message,
      type
    });

    if(batch.length >= 1000) {

      await saveBatch(batch);

      batch.length = 0;
    }
  }

  if(batch.length > 0) {
    await saveBatch(batch);
  }
}
```

This avoids memory issue and improves performance.

If failure happens in between, queue systems like BullMQ or RabbitMQ can be used with retries.

Stage 6 - Priority Inbox

Priority score is calculated based on type and recency.

```javascript
function calculatePriority(type) {

  const weights = {
    Placement: 3,
    Result: 2,
    Event: 1
  };

  return weights[type] || 0;
}
```

Recent placement notifications gets higher score compared to old event notifications.

Architecture Used

```txt
Route
  ↓
Handler
  ↓
Service
  ↓
Repository
  ↓
MySQL + Redis
```

Logging middleware is used in all layers.

```javascript
logger.info('service','Notification created');
logger.error('repository','DB query failed');
```

Performance

* Notification fetch: around 5-10ms with cache
* Bulk sending: around few seconds for 50k students
* Indexed query performance is much faster compared to normal scan
