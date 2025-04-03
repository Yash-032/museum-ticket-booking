import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Exhibition } from "@shared/schema";
import ExhibitionCard from "@/components/exhibitions/ExhibitionCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ChatBot from "@/components/chat/ChatBot";
import { Search, CalendarRange, Clock } from "lucide-react";

const ExhibitionsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: exhibitions = [], isLoading } = useQuery({
    queryKey: ["/api/exhibitions"],
  });
  
  // Filter exhibitions based on search query
  const filteredExhibitions = exhibitions.filter((exhibition: Exhibition) =>
    exhibition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exhibition.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group exhibitions
  const featuredExhibitions = filteredExhibitions.filter(
    (exhibition: Exhibition) => exhibition.isFeatured
  );
  
  const newExhibitions = filteredExhibitions.filter(
    (exhibition: Exhibition) => exhibition.isNew
  );
  
  const currentExhibitions = filteredExhibitions.filter(
    (exhibition: Exhibition) => 
      new Date(exhibition.startDate) <= new Date() && 
      new Date(exhibition.endDate) >= new Date()
  );
  
  const upcomingExhibitions = filteredExhibitions.filter(
    (exhibition: Exhibition) => new Date(exhibition.startDate) > new Date()
  );
  
  return (
    <>
      <Helmet>
        <title>{t("meta.exhibitionsTitle")} | MuseumTix</title>
        <meta name="description" content={t("meta.exhibitionsDescription")} />
      </Helmet>
      
      <div className="bg-neutral-50 py-8 md:py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("exhibitions.allExhibitions")}</h1>
            <p className="text-neutral-600 mb-6">{t("meta.exhibitionsDescription")}</p>
            
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder={t("exhibitions.searchPlaceholder")}
                className="pl-10 py-6"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredExhibitions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-neutral-500 mb-4">{t("exhibitions.noExhibitions")}</p>
                  <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExhibitions.map((exhibition: Exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="featured">
            {featuredExhibitions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-neutral-500">{t("exhibitions.noExhibitions")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredExhibitions.map((exhibition: Exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="new">
            {newExhibitions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-neutral-500">{t("exhibitions.noExhibitions")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newExhibitions.map((exhibition: Exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="current">
            {currentExhibitions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-neutral-500">{t("exhibitions.noExhibitions")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentExhibitions.map((exhibition: Exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming">
            {upcomingExhibitions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-neutral-500">{t("exhibitions.noExhibitions")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingExhibitions.map((exhibition: Exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("tickets.openingHours")}</CardTitle>
              <CardDescription>Plan your visit to the museum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex">
                    <CalendarRange className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <h3 className="font-medium">{t("tickets.openingHours")}</h3>
                      <ul className="text-neutral-600 space-y-1 text-sm">
                        <li>{t("tickets.hourMonday")}</li>
                        <li>{t("tickets.hourTueThur")}</li>
                        <li>{t("tickets.hourFriday")}</li>
                        <li>{t("tickets.hourWeekend")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex">
                    <Clock className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <h3 className="font-medium">{t("tickets.groupVisits")}</h3>
                      <p className="text-neutral-600 text-sm">{t("tickets.groupInfo")}</p>
                      <Link href="/tickets?group=true">
                        <Button variant="link" className="pl-0 h-auto">{t("tickets.learnMoreGroups")}</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ChatBot />
    </>
  );
};

export default ExhibitionsPage;
