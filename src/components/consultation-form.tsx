import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SelectField, phoneRegex } from "@/components/lead-form";
import { serviceOptions } from "@/data/services";
import { submitLead } from "@/lib/lead-submission";

const today = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().min(1, "Email address is required").email("Enter a valid email address"),
  businessName: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.string().min(1, "Select the service to discuss"),
  preferredDate: z
    .string()
    .min(1, "Select a preferred date")
    .refine((v) => v >= today(), "Choose today or a future date"),
  preferredTime: z.string().min(1, "Select a preferred time slot"),
  companyWebsite: z.string().max(0, "Leave this field empty").optional().or(z.literal("")),
  message: z.string().trim().max(600).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const slots = [
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
  "5:00 PM – 6:00 PM",
];

export function ConsultationForm() {
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      businessName: "",
      service: "",
      preferredDate: "",
      preferredTime: "",
      companyWebsite: "",
      message: "",
    },
  });

  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    setError(null);
    const result = await submitLead({
      source: "consultation",
      ...values,
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      submittedAt: new Date().toISOString(),
    });
    if (result.ok) {
      setReference(result.reference);
      form.reset();
    } else {
      setError(result.error);
    }
  }

  if (reference) {
    return (
      <div role="status" className="rounded-lg border border-border bg-card p-6 shadow-card md:p-8">
        <CalendarCheck className="h-8 w-8 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Thank you. Your request has been received.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The Incentify team will contact you regarding the next steps and confirm your consultation
          slot. Your reference number is{" "}
          <span className="font-semibold text-foreground">{reference}</span>. Requested slots are
          subject to availability.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setReference(null)}>
          Book another consultation
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card md:p-8">
      <h2 className="text-xl font-bold text-foreground">Request a consultation slot</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Consultations are held over call or video, {""}
        Monday to Saturday between 10:00 AM and 6:00 PM IST.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="consultationCompanyWebsite">Company website</label>
            <input
              id="consultationCompanyWebsite"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...form.register("companyWebsite")}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" maxLength={80} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input inputMode="tel" autoComplete="tel" maxLength={14} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input autoComplete="organization" maxLength={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SelectField
              control={form.control}
              name="service"
              label="Service to discuss *"
              placeholder="Select a service"
              options={serviceOptions}
            />
            <FormField
              control={form.control}
              name="preferredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred date *</FormLabel>
                  <FormControl>
                    <Input type="date" min={today()} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SelectField
              control={form.control}
              name="preferredTime"
              label="Preferred time *"
              placeholder="Select a slot"
              options={slots}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea rows={4} maxLength={600} {...field} />
                </FormControl>
                <FormDescription>
                  Optional. Anything that will help us prepare for the discussion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting ? "Submitting…" : "Request consultation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
