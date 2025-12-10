# 📊 Real-Time Dashboard Update Plan

## Pages to Update with Live Data

### ✅ Already Updated
1. **Messages Page** - ✅ Uses real database with SWR
2. **Dashboard Page** - ✅ Auto-refreshes every 10s
3. **Users Page** - ✅ Shows real user data

### 🔄 To Be Updated

#### 1. Broadcast Page
- Replace mock campaigns data
- Connect to `getBroadcasts()` action
- Add refresh interval
- Show real broadcast history

#### 2. Analytics Page  
- Update charts with real data
- Use `getDashboardStats()` 
- Add message trends
- Real intent distribution

#### 3. Training Page
- Show real training data count
- Display actual uploaded documents
- Live stats on training examples

#### 4. Settings Page
- Load real bot settings from database
- Save/update functionality

#### 5. Logs Page
- Real system logs
- Live activity feed

#### 6. Contacts Page
- Real special contacts from database

## Refresh Intervals

- **Critical Stats**: 10 seconds (dashboard, messages)
- **User Data**: 15 seconds (users, contacts)
- **Historical Data**: 30 seconds (analytics, logs)
- **Static Data**: 60 seconds (settings, training)

## Implementation Strategy

1. Add SWR with `refreshInterval` to each page
2. Replace mock data arrays with database queries
3. Add loading states
4. Add error handling
5. Set proper fallback data
