import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Video, MapPin, Clock, Users } from "lucide-react";

// Hardcoded events for now — can be made dynamic later
const EVENTS = [
  {
    id: "1",
    title: "Understanding NAV & Mutual Fund Returns",
    type: "Webinar",
    date: "2026-04-15",
    time: "3:00 PM - 4:30 PM",
    speaker: "Fund Management Team",
    description: "Learn how NAV is calculated, what affects fund returns, and how to read your portfolio statement effectively.",
    location: "Online (Zoom)",
    seats: 100,
    registered: 45,
  },
  {
    id: "2",
    title: "Tax-Efficient Investing in Bangladesh",
    type: "Workshop",
    date: "2026-04-22",
    time: "10:00 AM - 12:00 PM",
    speaker: "Tax Advisory Team",
    description: "Understand tax implications of mutual fund investments, dividend taxation by investor type, and tips for tax-efficient portfolio construction.",
    location: "Ekush WML Office, Dhaka",
    seats: 30,
    registered: 12,
  },
  {
    id: "3",
    title: "SIP: Building Wealth Systematically",
    type: "Webinar",
    date: "2026-05-01",
    time: "4:00 PM - 5:00 PM",
    speaker: "Relationship Management Team",
    description: "Why SIP is the smartest way to invest, how to choose the right SIP amount, and real examples of SIP wealth creation over time.",
    location: "Online (Zoom)",
    seats: 200,
    registered: 78,
  },
  {
    id: "4",
    title: "Annual General Meeting - EFUF",
    type: "AGM",
    date: "2026-05-15",
    time: "11:00 AM - 1:00 PM",
    speaker: "Board of Directors",
    description: "Annual General Meeting for Ekush First Unit Fund unitholders. Review of fund performance, financial statements, and dividend declaration.",
    location: "Dhaka Regency, Banani",
    seats: 500,
    registered: 230,
  },
];

export default function EventsPage() {
  const upcoming = EVENTS.filter(e => new Date(e.date) >= new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Events & Webinars</h1>
        <p className="text-sm text-gray-500">Investor education sessions, AGM/EGM notifications, and more</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Upcoming Events</p>
            <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Webinars</p>
            <p className="text-2xl font-bold">{EVENTS.filter(e => e.type === "Webinar").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">AGM/EGM</p>
            <p className="text-2xl font-bold">{EVENTS.filter(e => e.type === "AGM").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Cards */}
      <div className="space-y-4">
        {EVENTS.map((event) => {
          const isPast = new Date(event.date) < new Date();
          const spotsLeft = event.seats - event.registered;
          return (
            <Card key={event.id} className={isPast ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={event.type === "AGM" ? "warning" : event.type === "Webinar" ? "default" : "success"}>
                        {event.type}
                      </Badge>
                      {isPast && <Badge variant="outline">Past</Badge>}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {event.time}</span>
                      <span className="flex items-center gap-1">
                        {event.location.includes("Online") ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {event.registered}/{event.seats} registered</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Speaker: {event.speaker}</p>
                  </div>

                  <div className="shrink-0">
                    {!isPast ? (
                      <div className="text-center">
                        <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white w-full md:w-auto">
                          Register
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">{spotsLeft} spots left</p>
                      </div>
                    ) : (
                      <Badge variant="outline">Completed</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
